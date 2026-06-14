#include <DHT.h>          // biblioteca dos sensores DHT
#include <WiFi.h>         // biblioteca para conectar em redes wifi do esp32
#include <PubSubClient.h> // biblioteca para mqtt, usada para enviar os dados dos sensores para a nuvem e receber comandos de atuadores

// credenciais da rede wi-fi
const char *ssid = "nome da rede wi-fi";
const char *password = "senha da rede wi-fi";

const char *mqtt_server = "broker.emqx.io"; // broker mqtt utilizado para comunicação

WiFiClient espClient;               // cliente tcp utilizado pelo mqtt
PubSubClient mqttClient(espClient); // cliente mqtt

// função responsável por receber as mensagens do mqrr
void callback(
    char *topic,
    byte *payload,
    unsigned int length);

// função que mantém o esp32 conectado ao broker mqtt, e se desconectar, tenta reconectar
void conectarMQTT()
{
  while (!mqttClient.connected())
  {
    Serial.println("Conectando MQTT...");

    String clientId = "ESP32-" + String(random(0xffff), HEX); // gera um id único para evitar conflitos com outros clientes mqtt

    if (mqttClient.connect(clientId.c_str()))
    {
      Serial.println("MQTT conectado");

      // tópico para receber configurações da estufa
      mqttClient.subscribe(
          "ecocomp/estufa-001/actuators");

      mqttClient.subscribe(
          "ecocomp/estufa-001/config");
    }
    else
    {
      Serial.print("Erro MQTT: ");
      Serial.println(mqttClient.state());

      delay(3000);
    }
  }
}

const char *deviceId = "estufa-001"; // id da estufa, utilizado para identificar os dados enviados no broker mqtt

// sensores dht22
#define DHTTYPE DHT22
#define DHT_PIN_ESTUFA 4   // sensor interno da estufa
#define DHT_PIN_EXTERNO 19 // sensor externo da estufa

#define SOLO_PIN_ESTUFA 32  // sensor de umidade do solo interno da estufa
#define SOLO_PIN_EXTERNO 33 // sensor de umidade do solo externo da estufa

// neste projeto, o relé é ativo em HIGH
#define RELE_VENTOINHA 18 // ventoinha
#define RELE_BOMBA 5      // bomba de irrigação
#define RELE_LAMPADA 17   // lâmpada

// relé acionado em nível lógico HIGH, ou seja, para ligar o relé, é necessário escrever HIGH no pino correspondente. Para desligar, é necessário escrever LOW
const int RELE_LIGADO = HIGH;
const int RELE_DESLIGADO = LOW;

// calibração dos sensore de umidade do solo
const int SOLO_ESTUFA_SECO = 4095;
const int SOLO_ESTUFA_MOLHADO = 1300;

const int SOLO_EXTERNO_SECO = 4095;
const int SOLO_EXTERNO_MOLHADO = 1300;

const int AMOSTRAS_SOLO = 10; // quantidade de leituras para média

const unsigned long INTERVALO_ENVIO_MS = 600000; // intervalo de envio das leituras dos sensores para o broker mqtt, em milissegundos, nesse caso, 10 minutos

// configurações e estado dos atuadores, que podem ser controlados tanto pela lógica automática do código, quanto por mensagens recebidas via mqtt
struct Config
{
  int soloMin = 40;
  int tempMax = 32;
  int tempMin = 18;
};

// estado dos atuadores recebidos via mqtt
struct Atuadores
{
  bool bomba = false;
  bool ventoinha = false;
  bool lampada = false;
};

DHT dhtEstufa(DHT_PIN_ESTUFA, DHTTYPE);
DHT dhtExterno(DHT_PIN_EXTERNO, DHTTYPE);

Config config;
Atuadores atuadores;

unsigned long ultimoEnvio = 0; // controle de tempo para envio dos dados

// reconecta o wi-fi caso necessário
void conectarWiFi()
{
  WiFi.mode(WIFI_STA);

  Serial.println("Iniciando WiFi...");
  Serial.print("SSID: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print("Status = ");
    Serial.println(WiFi.status());

    delay(1000);
  }

  Serial.println("WiFi conectado!");
  Serial.println(WiFi.localIP());
}

// função para ler o valor bruto do sensor de umidade do solo, fazendo uma média de várias leituras para melhorar a estabilidade da leitura
int lerSoloRaw(int pino)
{
  long soma = 0;

  analogRead(pino);
  delay(5);

  for (int i = 0; i < AMOSTRAS_SOLO; i++)
  {
    soma += analogRead(pino);
    delay(3);
  }

  return soma / AMOSTRAS_SOLO;
}

int soloRawParaPorcentagem(int leitura, int seco, int molhado)
{
  int porcentagem = map(leitura, seco, molhado, 0, 100);
  return constrain(porcentagem, 0, 100);
}

void callback(
    char *topic,
    byte *payload,
    unsigned int length)
{
  String mensagem;

  for (int i = 0; i < length; i++)
  {
    mensagem += (char)payload[i];
  }

  Serial.println(topic);
  Serial.println(mensagem);

  // recebe o comando dos atuadores
  if (String(topic) ==
      "ecocomp/estufa-001/actuators")
  {
    atuadores.bomba =
        mensagem.indexOf("\"bomba\":true") >= 0;

    atuadores.ventoinha =
        mensagem.indexOf("\"ventoinha\":true") >= 0;

    atuadores.lampada =
        mensagem.indexOf("\"lampada\":true") >= 0;
  }

  // recebe a configuração dos parâmetros da estufa
  if (String(topic) ==
      "ecocomp/estufa-001/config")
  {
    int idx;

    idx = mensagem.indexOf("soloMin");
    if (idx >= 0)
    {
      config.soloMin =
          mensagem.substring(
                      idx + 9,
                      mensagem.indexOf(",", idx))
              .toInt();
    }

    idx = mensagem.indexOf("tempMax");
    if (idx >= 0)
    {
      config.tempMax =
          mensagem.substring(
                      idx + 9,
                      mensagem.indexOf(",", idx))
              .toInt();
    }

    idx = mensagem.indexOf("tempMin");
    if (idx >= 0)
    {
      config.tempMin =
          mensagem.substring(
                      idx + 9,
                      mensagem.indexOf("}", idx))
              .toInt();
    }
  }
}

// publica os dados dos sensores no broker mqtt
void enviarDadosSensores(
    float tEstufa,
    float hEstufa,
    int soloEstufa,
    float tExterno,
    float hExterno,
    int soloExterno)
{
  if (WiFi.status() != WL_CONNECTED)
  {
    return;
  }

  String jsonPayload = "{";
  jsonPayload += "\"deviceId\":\"" + String(deviceId) + "\",";
  jsonPayload += "\"soil\":" + String(soloEstufa) + ",";
  jsonPayload += "\"airHumidity\":" + String(hEstufa, 2) + ",";
  jsonPayload += "\"airTemp\":" + String(tEstufa, 2) + ",";
  jsonPayload += "\"soilExternal\":" + String(soloExterno) + ",";
  jsonPayload += "\"airHumidityExternal\":" + String(hExterno, 2) + ",";
  jsonPayload += "\"tempExternal\":" + String(tExterno, 2);
  jsonPayload += "}";

  mqttClient.publish(
      "ecocomp/estufa-001/telemetry",
      jsonPayload.c_str());

  Serial.println(jsonPayload);
}

void aplicarSaidas(float tEstufa, int soloEstufa, int rawSoloEstufa)
{
  bool soloEstufaConfiavel = rawSoloEstufa > 20 && rawSoloEstufa < 4075;
  bool bombaAutomatica = soloEstufaConfiavel && soloEstufa <= config.soloMin;
  bool ventoinhaAutomatica = !isnan(tEstufa) && tEstufa >= config.tempMax;
  bool lampadaAutomatica = !isnan(tEstufa) && tEstufa <= config.tempMin;

  bool bombaFinal = atuadores.bomba || bombaAutomatica;
  bool ventoinhaFinal = atuadores.ventoinha || ventoinhaAutomatica;
  bool lampadaFinal = atuadores.lampada || lampadaAutomatica;

  digitalWrite(RELE_BOMBA, bombaFinal ? RELE_LIGADO : RELE_DESLIGADO);
  digitalWrite(RELE_LAMPADA, lampadaFinal ? RELE_LIGADO : RELE_DESLIGADO);
  digitalWrite(RELE_VENTOINHA, ventoinhaFinal ? RELE_LIGADO : RELE_DESLIGADO);

  Serial.print("Bomba manual: ");
  Serial.print(atuadores.bomba ? "ON" : "OFF");
  Serial.print(" | automatica: ");
  Serial.print(bombaAutomatica ? "ON" : "OFF");
  Serial.print(" | rele final: ");
  Serial.println(bombaFinal ? "ON" : "OFF");

  Serial.print("Ventoinha manual: ");
  Serial.print(atuadores.ventoinha ? "ON" : "OFF");
  Serial.print(" | automatica: ");
  Serial.print(ventoinhaAutomatica ? "ON" : "OFF");
  Serial.print(" | rele final: ");
  Serial.println(ventoinhaFinal ? "ON" : "OFF");

  Serial.print("Lampada manual: ");
  Serial.print(atuadores.lampada ? "ON" : "OFF");
  Serial.print(" | automatica: ");
  Serial.print(lampadaAutomatica ? "ON" : "OFF");
  Serial.print(" | rele final: ");
  Serial.println(lampadaFinal ? "ON" : "OFF");
}

// função setup, responsável por inicializar os sensores, atuadores, conexões e configurações iniciais
void setup()
{
  Serial.begin(115200);

  // inicializa os sensores dht
  dhtEstufa.begin();
  dhtExterno.begin();

  // configura os pinos de entrada dos sensores
  pinMode(SOLO_PIN_ESTUFA, INPUT);
  pinMode(SOLO_PIN_EXTERNO, INPUT);

  // configura os pinos de saída dos atuadores
  pinMode(RELE_VENTOINHA, OUTPUT);
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(RELE_LAMPADA, OUTPUT);

  // inicia tudo desligado
  digitalWrite(RELE_VENTOINHA, RELE_DESLIGADO);
  digitalWrite(RELE_BOMBA, RELE_DESLIGADO);
  digitalWrite(RELE_LAMPADA, RELE_DESLIGADO);

  // configuração adc do esp32
  analogReadResolution(12);
  analogSetPinAttenuation(SOLO_PIN_ESTUFA, ADC_11db);
  analogSetPinAttenuation(SOLO_PIN_EXTERNO, ADC_11db);

  Serial.println("Iniciando...");
  Serial.println("Ventoinha, bomba e lampada habilitadas com controle manual e automatico.");

  conectarWiFi(); // conecta ao wifi

  mqttClient.setServer(mqtt_server, 1883); // configura o servidor mqtt

  mqttClient.setCallback(callback); // configura a função de recebimento de mensagens do mqtt

  conectarMQTT(); // conecta ao servidor mqtt
}

// loop principal
void loop()
{
  // garante a conexão wi-fi e mqtt
  if (WiFi.status() != WL_CONNECTED)
  {
    conectarWiFi();
  }

  if (!mqttClient.connected())
  {
    conectarMQTT();
  }
  mqttClient.loop(); // processa mensagens recebidas do mqtt

  // leitura dos sensores
  float tEstufa = dhtEstufa.readTemperature();
  float hEstufa = dhtEstufa.readHumidity();

  float tExterno = dhtExterno.readTemperature();
  float hExterno = dhtExterno.readHumidity();

  int rawSoloEstufa = lerSoloRaw(SOLO_PIN_ESTUFA);
  int rawSoloExterno = lerSoloRaw(SOLO_PIN_EXTERNO);

  int soloEstufa = soloRawParaPorcentagem(
      rawSoloEstufa,
      SOLO_ESTUFA_SECO,
      SOLO_ESTUFA_MOLHADO);

  int soloExterno = soloRawParaPorcentagem(
      rawSoloExterno,
      SOLO_EXTERNO_SECO,
      SOLO_EXTERNO_MOLHADO);

  unsigned long agora = millis();

  // aplica as saídas para os atuadores, considerando tanto a lógica automática quanto os comandos manuais recebidos via mqtt
  aplicarSaidas(tEstufa, soloEstufa, rawSoloEstufa);

  Serial.println("\n------ STATUS ECOCOMP ------");
  Serial.println("\nESTUFA:");
  Serial.print("Temp: ");
  Serial.println(tEstufa);
  Serial.print("Umidade: ");
  Serial.println(hEstufa);
  Serial.print("RAW Solo: ");
  Serial.println(rawSoloEstufa);
  Serial.print("Solo %: ");
  Serial.println(soloEstufa);

  Serial.println("\nEXTERNO:");
  Serial.print("Temp: ");
  Serial.println(tExterno);
  Serial.print("Umidade: ");
  Serial.println(hExterno);
  Serial.print("RAW Solo: ");
  Serial.println(rawSoloExterno);
  Serial.print("Solo %: ");
  Serial.println(soloExterno);

  Serial.println("\nCONFIG:");
  Serial.print("soloMin: ");
  Serial.println(config.soloMin);
  Serial.print("tempMax: ");
  Serial.println(config.tempMax);
  Serial.print("tempMin: ");
  Serial.println(config.tempMin);

  Serial.println("\nATUADORES API:");
  Serial.print("bomba: ");
  Serial.println(atuadores.bomba ? "ON" : "OFF");
  Serial.print("ventoinha: ");
  Serial.println(atuadores.ventoinha ? "ON" : "OFF");
  Serial.print("lampada: ");
  Serial.println(atuadores.lampada ? "ON" : "OFF");
  Serial.println("---------------------------");

  if (!isnan(tEstufa) && !isnan(hEstufa) &&
      !isnan(tExterno) && !isnan(hExterno))
  {
    if (agora - ultimoEnvio >= INTERVALO_ENVIO_MS)
    {
      enviarDadosSensores(
          tEstufa,
          hEstufa,
          soloEstufa,
          tExterno,
          hExterno,
          soloExterno);

      ultimoEnvio = agora;
    }
  }
  else
  {
    Serial.println("Erro leitura DHT");
  }

  delay(1000);
}