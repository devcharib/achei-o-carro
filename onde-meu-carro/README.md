# Onde Meu Carro — PWA

Salve onde você estacionou e navegue de volta com um toque.

---

## Como rodar no seu computador

### 1. Abra a pasta no VSCode
Abra o VSCode e vá em **File → Open Folder** e selecione a pasta `onde-meu-carro`.

### 2. Abra o terminal integrado
No VSCode: **Terminal → New Terminal** (ou `Ctrl + '`).

### 3. Instale as dependências
```bash
npm install
```

### 4. (Opcional) Gere os ícones do app
```bash
npm run icons
```

### 5. Rode o servidor local
```bash
npm start
```

Acesse no navegador: **http://localhost:3000**

---

## Como instalar no celular (Android)

1. No Android, abra o Chrome
2. Acesse o IP do seu computador na mesma rede Wi-Fi:
   - Descubra seu IP: no terminal, digite `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
   - Acesse: `http://SEU_IP:3000`
3. Toque no menu (⋮) → **"Adicionar à tela inicial"**
4. Pronto! O app aparece como ícone na sua tela

## Como instalar no iPhone (iOS)

1. No iPhone, abra o **Safari**
2. Acesse `http://SEU_IP:3000`
3. Toque em **Compartilhar** (ícone de caixa com seta para cima)
4. Toque em **"Adicionar à Tela de Início"**
5. Pronto!

---

## Funcionalidades

- Salva sua localização atual com GPS
- Nome personalizado para cada ponto (ex: "Vaga B4", "Show")
- Navega de volta usando Google Maps
- Histórico de todos os pontos salvos
- Funciona offline após primeira visita
- Dados salvos no próprio celular (sem servidor)

---

## Próximos passos (futuro)

- Compartilhar localização via link/WhatsApp
- Rastro de percurso no mapa
- Notas e fotos no ponto salvo
- Deploy na internet (Vercel/Netlify) para acessar de qualquer lugar
