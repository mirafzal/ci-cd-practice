# Jenkins CI/CD Setup Guide

This guide covers the full setup of Jenkins in Docker, connecting an agent using JNLP/WebSocket, and configuring credentials for GitHub and pipeline secrets.

---

## 1. Install Jenkins in Docker

```bash
mkdir -p ~/jenkins_home
chmod 777 ~/jenkins_home

docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v ~/jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

- Access Jenkins at: `http://<your-server-ip>:8080`
- Initial admin password: `~/jenkins_home/secrets/initialAdminPassword`

---

## 2. Create Agent in Jenkins UI

1. Go to **Manage Jenkins > Nodes > New Node**
2. Name: `jenkins-agent`
3. Type: **Permanent Agent**
4. Configure:
    - **# of executors:** 2
    - **Remote root directory:** `/opt/jenkins-agent`
    - **Labels:** `linux-agent` (optional)
    - **Launch method:** _Launch agent by connecting it to the controller_
5. Save → On the node page, Jenkins shows connection instructions

---

## 3. Install Java & Jenkins Agent on the Agent Server

### 3.1 Install Java
```bash
sudo apt update
sudo apt install -y openjdk-17-jre
```

### 3.2 Create Agent Directory & Download `agent.jar`
```bash
sudo mkdir -p /opt/jenkins-agent
cd /opt/jenkins-agent
wget http://<jenkins-controller-ip>:8080/jnlpJars/agent.jar
```

### 3.3 Create a systemd Service
```bash
sudo nano /etc/systemd/system/jenkins-agent.service
```
Paste:
```ini
[Unit]
Description=Jenkins Agent
After=network.target

[Service]
User=root
Environment="PATH=/usr/local/go/bin:/usr/bin:/bin"
WorkingDirectory=/opt/jenkins-agent
ExecStart=/usr/bin/java -jar /opt/jenkins-agent/agent.jar \
  -url http://<jenkins-controller-ip>:8080/ \
  -secret <agent-secret> \
  -name "jenkins-agent" \
  -webSocket \
  -workDir "/opt/jenkins-agent/"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Reload and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable jenkins-agent
sudo systemctl start jenkins-agent
```

---

## 4. Set Up GitHub Repo Credentials

1. Go to **Manage Jenkins > Credentials > (Global) > Add Credentials**
2. Kind: `Username with password`
3. Username: GitHub username
4. Password: GitHub Personal Access Token (with repo access)
5. ID: `github-creds`

Use in pipeline:
```groovy
checkout([
  $class: 'GitSCM',
  branches: [[name: '*/main']],
  userRemoteConfigs: [[
    url: 'https://github.com/your/repo.git',
    credentialsId: 'github-creds'
  ]]
])
```

---

## 5. Set Up Pipeline Credentials

Add the following in **Manage Jenkins > Credentials > Global**:

| ID                   | Kind                        | Secret Value                        |
|----------------------|-----------------------------|--------------------------------------|
| ssh_user             | Secret text                 | your SSH username                   |
| ssh_host             | Secret text                 | your server IP or domain            |
| ssh_port             | Secret text (optional)      | 22 or custom port                   |
| ssh_key              | SSH username with private key | your private SSH key             |
| registry_token       | Secret text                 | DigitalOcean container token        |
| telegram_bot_token   | Secret text                 | Telegram bot token                  |
| telegram_chat_id     | Secret text                 | Your chat ID (e.g., 635793263)      |

Use in pipeline like:
```groovy
environment {
  SSH_USER = credentials('ssh_user')
  REGISTRY_TOKEN = credentials('registry_token')
}
```

---

## 6. Install SSH Agent Plugin

1. Go to **Manage Jenkins > Plugin Manager > Available**
2. Search for: `SSH Agent Plugin`
3. Check it and click **Install without restart**

This enables use of `sshagent {}` blocks in Jenkinsfiles:
```groovy
sshagent(credentials: ['ssh_key']) {
  sh 'scp ...'
}
```

---

You’re now ready to use Jenkins with a custom agent, private GitHub repo access, secret injection, and deployment!

