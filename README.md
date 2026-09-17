# ForgeCalc3D

[English](#en) • [Português](#pt)

---

<a id="en"></a>
# 🇺🇸 ForgeCalc3D (EN)

**ForgeCalc3D** is a 3D printing cost and pricing utility calculator developed for studios, maker labs, and independent operators. It operates **100% autonomously and offline** (no login or internet connection required), accurately calculating true production costs and suggesting competitive selling margins for both wholesale/resale and direct retail consumers.

---

## 🎯 Features

- **Real-Time Calculator**:
  - Filament and resin costs considering scrap/waste margins and cost per gram ($/g).
  - Electricity costs based on power consumption in Watts and printing time (h/min).
  - Operator labor costs (setup, post-processing, slicing).
  - Machine hourly wear-and-tear and depreciation.
  - Extra hardware & consumables (screws, heat-set inserts, magnets, packaging, stickers, etc.).
  - Automatic price suggestions for **Resale** and **Final Consumer** with adjustable multipliers.
  - Quick copy of formatted quote for clients (WhatsApp / Email).
- **Filament & Resin Management**:
  - Spool registration with weight, price, and scrap margin.
  - Material type filters (PLA, PETG, ABS, TPU, Resin, ASA, etc.) and quick search.
  - Instant calculation of cost per gram for each material.
- **3D Printer Management**:
  - Machine profile registration with average power (W), energy tariffs, and hourly maintenance reserve.
  - Presets for popular 3D printers.
- **Saved Quotes (History)**:
  - Save quotes with part name and date.
  - Reload any previously calculated quote with a single click.
- **Settings & Local Backup (JSON)**:
  - Default financial parameters for your operation.
  - Export and import `.json` file for backup or data transfer between devices and browsers.

---

## 📱 Download the App (GitHub Releases)

If you only want to install and use the app on your Android device without building it from source:
1. Go to the [Releases](https://github.com/weltonsantosfr/ForgeCalc3D/releases) section of this repository.
2. Locate the latest version marked as **Latest**.
3. Under the **Assets** section, download the `.apk` file (e.g., `app-debug.apk` or `ForgeCalc3D.apk`).
4. On your Android smartphone, open the downloaded file and confirm installation (allow installation from unknown sources if prompted by your browser or file manager).

---

## 🏗️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Local Database**: [Dexie.js](https://dexie.org/) (Reactive IndexedDB)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Mobile Platform**: [Capacitor](https://capacitorjs.com/) (Android / iOS)
- **Unit Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- npm or pnpm
- *(To compile the APK)*: JDK 21+ and Android SDK configured

### Installation
```bash
npm install
```

### Development Mode (Web)
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Run Unit Tests
```bash
npm test
```

### Production Web Build
```bash
npm run build
```

### Build Android APK
To directly generate the debug `.apk` file:
```bash
npm run build:android
```
The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📐 Calculation Formulas

$$\text{Filament Cost} = \text{Weight with Loss (g)} \times \left(\frac{\text{Spool Price}}{\text{Spool Weight}}\right)$$
$$\text{Consumption (kWh)} = \left(\frac{\text{Power (W)}}{1000}\right) \times \left(\text{Hours} + \frac{\text{Minutes}}{60}\right)$$
$$\text{Total Cost} = \text{Filament} + \text{Energy} + \text{Labor} + \text{Maintenance} + \text{Extras}$$
$$\text{Resale Price} = \text{Total Cost} \times \text{Resale Multiplier}$$
$$\text{Consumer Price} = \text{Total Cost} \times \text{Retail Multiplier}$$

---

## 📄 License

Distributed under the MIT License. 100% autonomous and offline operation.

---
---

<a id="pt"></a>
# 🇧🇷 ForgeCalc3D (PT)

**ForgeCalc3D** é uma calculadora utilitária de custos e precificação para impressão 3D desenvolvida para estúdios e operadores autônomos. Opera de forma **100% autônoma e offline** (sem necessidade de login ou internet), calculando com precisão os custos reais de produção e sugerindo margens de venda competitivas para revenda e consumidor final.

---

## 🎯 Funcionalidades

- **Calculadora em Tempo Real**:
  - Custos com filamento/resina considerando margem de perda e custo por grama ($R\$/g$).
  - Custos de energia elétrica com base no consumo em Watts e tempo de impressão (h/min).
  - Mão de obra do operador (setup, acabamento, fatiamento).
  - Desgaste e depreciação da impressora por hora.
  - Insumos extras (parafusos, insertos, ímãs, embalagens, adesivos, etc.).
  - Sugestão automática de preços para **Revenda** e **Consumidor Final** com multiplicadores ajustáveis.
  - Cópia rápida de orçamento formatado para clientes (WhatsApp / E-mail).
- **Gestão de Filamentos & Resinas**:
  - Cadastro de carretéis com peso, valor e margem de perda.
  - Filtros por tipo de material (PLA, PETG, ABS, TPU, Resina, ASA, etc.) e busca rápida.
  - Cálculo instantâneo do custo por grama em cada material.
- **Gestão de Impressoras 3D**:
  - Cadastro de equipamentos com potência média (W), tarifas e reservas de manutenção por hora.
  - Presets de máquinas populares.
- **Orçamentos Salvos (Histórico)**:
  - Salve orçamentos com nome da peça e data.
  - Recarregue qualquer orçamento previamente calculado com um único clique.
- **Configurações & Backup Local (JSON)**:
  - Parâmetros financeiros padrão da sua operação.
  - Exportação e importação de arquivo `.json` para backup ou transferência de dados entre celulares e navegadores.

---

## 📱 Baixar o Aplicativo (Releases do GitHub)

Se você deseja apenas instalar e utilizar o aplicativo no seu dispositivo Android sem precisar compilar o código fonte:
1. Acesse a seção de [Releases](https://github.com/weltonsantosfr/ForgeCalc3D/releases) deste repositório.
2. Localize a versão mais recente identificada como **Latest**.
3. Na seção **Assets**, baixe o arquivo `.apk` disponível (ex.: `app-debug.apk` ou `ForgeCalc3D.apk`).
4. No seu dispositivo Android, abra o arquivo baixado e confirme a instalação (habilite a permissão para instalar fontes desconhecidas caso solicitado pelo navegador ou gerenciador de arquivos).

---

## 🏗️ Stack Tecnológica

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Banco de Dados Local**: [Dexie.js](https://dexie.org/) (IndexedDB reativo)
- **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Plataforma Mobile**: [Capacitor](https://capacitorjs.com/) (Android / iOS)
- **Testes Unitários**: [Vitest](https://vitest.dev/)

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v20+)
- npm ou pnpm
- *(Para compilar o APK)*: JDK 21+ e Android SDK configurados

### Instalação
```bash
npm install
```

### Modo de Desenvolvimento (Web)
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### Executar Testes Unitários
```bash
npm test
```

### Build Web de Produção
```bash
npm run build
```

### Gerar APK Android
Para gerar o arquivo `.apk` de debug diretamente:
```bash
npm run build:android
```
O APK será gerado em:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📐 Fórmulas de Cálculo

$$\text{Custo Filamento} = \text{Peso com Perda (g)} \times \left(\frac{\text{Preço do Carretel}}{\text{Peso do Carretel}}\right)$$
$$\text{Consumo (kWh)} = \left(\frac{\text{Potência (W)}}{1000}\right) \times \left(\text{Horas} + \frac{\text{Minutos}}{60}\right)$$
$$\text{Custo Total} = \text{Filamento} + \text{Energia} + \text{Mão de Obra} + \text{Manutenção} + \text{Extras}$$
$$\text{Preço Revenda} = \text{Custo Total} \times \text{Multiplicador Revenda}$$
$$\text{Preço Consumidor} = \text{Custo Total} \times \text{Multiplicador Varejo}$$

---

## 📄 Licença

Distribuído sob licença MIT. Operação 100% autônoma e offline.
