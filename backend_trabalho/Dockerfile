# Usa a imagem oficial do Node.js baseada em Alpine Linux para ser leve e segura
FROM node:20-alpine

# Define o diretorio de trabalho dentro do container
WORKDIR /app

# Copia os manifestos de dependencias
COPY package*.json ./

# Instala apenas as dependencias de producao
RUN npm install --omit=dev

# Copia todo o codigo-fonte do backend
COPY . .

# Informa a porta em que a aplicacao escuta
EXPOSE 40000

# Variavel padrao de porta
ENV PORT=40000

# Comando para iniciar o servidor
CMD ["npm", "start"]

