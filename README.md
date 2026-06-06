# 🌱 EcoComp – Inteligência Computacional Aplicada ao Monitoramento de Ecossistemas

O **EcoComp** é um sistema de monitoramento e automação de estufas inteligentes desenvolvido utilizando conceitos de **Internet das Coisas (IoT)**, **Computação em Nuvem**, **Sistemas Embarcados** e **Desenvolvimento Web**.

O projeto permite acompanhar em tempo real as condições ambientais de uma estufa por meio de sensores conectados a um ESP32, além de controlar dispositivos de irrigação, ventilação e aquecimento remotamente através de uma aplicação web.

---

## 🚀 Funcionalidades

### 📊 Monitoramento em Tempo Real

- Temperatura interna da estufa
- Umidade do ar interna
- Umidade do solo interna
- Temperatura externa
- Umidade do ar externa
- Umidade do solo externa

### 🤖 Automação Inteligente

- Acionamento automático da bomba de irrigação
- Controle automático da ventoinha
- Controle automático da lâmpada de aquecimento
- Configuração dos limites de automação diretamente pela aplicação web

### 🌐 Aplicação Web

- Cadastro de usuários
- Login e autenticação
- Dashboard em tempo real
- Histórico de medições
- Filtros por período
- Exportação de relatórios
- Controle manual dos atuadores

### ☁️ Infraestrutura

- Comunicação MQTT
- API REST em Node.js
- Banco de dados MongoDB Atlas
- Hospedagem da API no Render
- Controle de versão com Git e GitHub

---

## 🏗️ Arquitetura do Sistema

```text
           ┌─────────────────┐
           │     Sensores    │
           │ DHT22 e Solo    │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │      ESP32      │
           │ Coleta dos dados│
           └────────┬────────┘
                    │ MQTT
                    ▼
           ┌─────────────────┐
           │  Broker MQTT    │
           └────────┬────────┘
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
┌───────────────┐        ┌────────────────┐
│ Backend Node  │        │ MQTT Explorer  │
│ + MongoDB     │        │ (Monitoramento)│
└───────┬───────┘        └────────────────┘
        │
        ▼
┌─────────────────┐
│ Aplicação Web   │
│ Dashboard       │
│ Histórico       │
│ Configurações   │
└─────────────────┘
```

---

## 🔧 Tecnologias Utilizadas

### Hardware

- ESP32
- 2 Sensores DHT22
- 2 Sensores de Umidade do Solo
- Bomba de Irrigação
- Ventoinha
- Lâmpada

### Software

#### Backend

- Node.js
- Express.js
- MQTT.js
- MongoDB Atlas
- JWT
- bcrypt

#### Frontend

- HTML5
- CSS3
- JavaScript

#### Infraestrutura

- MQTT
- Render
- GitHub

---

## 📂 Estrutura do Projeto

```text
projeto-ecocomp-mqtt
│
├── frontend
│   ├── home.html
│   ├── historico.html
│   ├── config.html
│   ├── login.html
│   ├── cadastro.html
│   ├── script.js
│   ├── historico.js
│   ├── config.js
│   └── style.css
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controller
│   │   ├── dao
│   │   ├── middleware
│   │   ├── model
│   │   ├── router
│   │   ├── service
│   │   └── view
│   │
│   ├── app.js
│   ├── server.js
│   ├── generate-devices.js
│   └── simulador_esp.js
│
└── README.md
```

---

## 🧩 Padrão Arquitetural

O backend foi desenvolvido seguindo o padrão **MVC (Model-View-Controller)**.

### Model

Responsável pela representação dos dados e integração com o MongoDB.

### Controller

Recebe as requisições HTTP e coordena o fluxo de execução.

### Service

Implementa as regras de negócio do sistema:

- Processamento de telemetria
- Automação da estufa
- Controle dos atuadores
- Publicação MQTT

### DAO

Responsável pelo acesso ao banco de dados.

### Router

Define as rotas da API.

### Middleware

Realiza autenticação e validações.

---

## 📡 Comunicação MQTT

### Tópicos Utilizados

#### Telemetria

```text
ecocomp/estufa-001/telemetry
```

Publica:

```json
{
  "deviceId": "estufa-001",
  "soil": 45,
  "airTemp": 24,
  "airHumidity": 62,
  "soilExternal": 40,
  "tempExternal": 22,
  "airHumidityExternal": 65
}
```

#### Atuadores

```text
ecocomp/estufa-001/actuators
```

Recebe:

```json
{
  "bomba": true,
  "ventoinha": false,
  "lampada": false
}
```

#### Configurações

```text
ecocomp/estufa-001/config
```

Recebe:

```json
{
  "soloMin": 40,
  "tempMax": 32,
  "tempMin": 18
}
```

---

## 🤖 Regras de Automação

O sistema realiza automaticamente o controle dos atuadores com base nos limites configurados.

### Irrigação

```text
Se umidade do solo ≤ soloMin
→ Liga a bomba
```

### Resfriamento

```text
Se temperatura ≥ tempMax
→ Liga a ventoinha
```

### Aquecimento

```text
Se temperatura ≤ tempMin
→ Liga a lâmpada
```

---

## 🗄️ Banco de Dados

O MongoDB Atlas utiliza as seguintes coleções:

### devices

Cadastro das estufas monitoradas pelo sistema.

### readings

Histórico completo das medições realizadas pelos sensores.

### configs

Configurações de automação da estufa.

### actuators

Estado atual dos atuadores.

### users

Usuários cadastrados na plataforma.

---

## 📸 Funcionalidades da Interface

### Dashboard

- Dados em tempo real
- Comparação entre ambiente interno e externo
- Indicadores visuais

### Histórico

- Últimas 24 horas
- Últimos 7 dias
- Últimos 30 dias
- Período personalizado

### Configurações

- Controle manual dos atuadores
- Configuração dos parâmetros automáticos

### Usuários

- Cadastro
- Login
- Recuperação de senha

---

## 👩‍💻 Desenvolvedoras

- Laura Trigo
- Josiely Toledo

Projeto desenvolvido para a disciplina de **Inteligência Computacional Aplicada ao Monitoramento de Ecossistemas**.

---

## 📜 Licença

Este projeto possui fins acadêmicos e educacionais.
