# Serviço systemd para Aplicação Node.js (omnidroid-v-x1)
## Bot da Twitch com integração OBS e autenticação OAuth2
Este documento descreve como configurar um serviço systemd que executa automaticamente o omnidroid-v-x1 e instala as dependências via `npm install` sempre que o serviço for iniciado.

## Estrutura esperada

- Diretório da aplicação: /var/twitch/omnidroid-v-x1
- Arquivo principal da aplicação: index.js
- package.json deve estar presente no mesmo diretório.

## Arquivo do serviço systemd

Crie o arquivo de serviço:
```bash
sudo nano /etc/systemd/system/omnidroid.service
```
Insira o conteúdo abaixo:
```bash
[Unit] 
Description=servico-node: omnidroid-v-x1

[Service]
User=orangepi
Group=orangepi
Environment=NODE_ENV=production
WorkingDirectory=/var/twitch/Omnidroid-v-X1
ExecStartPre=/bin/sh -c "npm install"
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=omnidroid-v-x1


[Install]
WantedBy=multi-user.target
```

## Instale o cross-env localmente

```
npm install cross-env --save
```


## Ou instale o cross-env globalmente

```
npm install -g cross-env
```

## Ativando o serviço

Execute os comandos abaixo:
```bash
sudo systemctl daemon-reload  
sudo systemctl enable omnidroid.service  
sudo systemctl start omnidroid.service
```
## Monitorando o serviço

Ver status:
```bash
sudo systemctl status omnidroid.service
```
Ver logs em tempo real:
```bash
journalctl -u omnidroid.service -f
```
## Notas

- O ExecStartPre=/usr/bin/npm install garante que dependências estejam sempre atualizadas.
- Esse comando é executado toda vez que o serviço iniciar (reboot ou restart manual).
- Confirme que npm e node estão instalados em /usr/bin/ (use which npm e which node).
- Garanta que o usuário orangepi tenha permissão sobre o diretório da aplicação:

-  ──>  sudo chown -R orangepi:orangepi /var/twitch/omnidroid-v-x1

## Estrutura exemplo da aplicação

/var/twitch/omnidroid-v-x1  
├── index.js  
├── package.json  
└── node_modules/ (criado automaticamente após o primeiro start)

## Pronto!

Sua aplicação Node.js está configurada para iniciar automaticamente com o sistema e manter as dependências atualizadas.
