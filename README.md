# ForgeCalc3D

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
