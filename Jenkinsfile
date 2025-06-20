pipeline {
  agent { label 'jenkins-agent' }
  environment {
    REGISTRY = "registry.digitalocean.com/my-registry123/mygoapp"
    IMAGE_TAG = "${env.GIT_COMMIT}"
    SSH_PORT = credentials('ssh_port') // default or optional
    SSH_HOST = credentials('ssh_host')
    SSH_USER = credentials('ssh_user')
    SSH_KEY = credentials('ssh_key') // Jenkins secret (SSH private key)
    REGISTRY_TOKEN = credentials('registry_token')
    TELEGRAM_TOKEN = credentials('telegram_bot_token')
    TELEGRAM_CHAT_ID = credentials('telegram_chat_id')
  }

  options {
    timestamps()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Test Go App') {
      steps {
        dir('mygoapp') {
          sh '''
            go mod tidy
            go test ./...
          '''
        }
      }
    }

    stage('Build & Push Docker Image') {
      steps {
        dir('mygoapp') {
          sh '''
            echo "$REGISTRY_TOKEN" | docker login registry.digitalocean.com -u paulbundy07@gmail.com --password-stdin
            docker build -t $REGISTRY:$IMAGE_TAG .
            docker push $REGISTRY:$IMAGE_TAG
          '''
        }
      }
    }

    stage('Deploy to Remote') {
      steps {
        sshagent (credentials: ['ssh_key']) {
          sh '''
            scp -P ${SSH_PORT} -r mygoapp/deploy/* ${SSH_USER}@${SSH_HOST}:/opt/mygoapp/

            ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << EOF
              set -e
              cd /opt/mygoapp/
              echo "$REGISTRY_TOKEN" | docker login registry.digitalocean.com -u paulbundy07@gmail.com --password-stdin
              yq -i '.services.app.image = "${REGISTRY}:${IMAGE_TAG}"' docker-compose.yaml
              docker compose up -d --remove-orphans
EOF
          '''
        }
      }
    }
  }

  post {
    success {
      script {
        sh '''
          curl -s -X POST https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage \\
            -d chat_id=${TELEGRAM_CHAT_ID} \\
            -d text="✅ Jenkins: mygoapp deployed successfully. Commit: ${GIT_COMMIT}"
        '''
      }
    }

    failure {
      script {
        sh '''
          curl -s -X POST https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage \\
            -d chat_id=${TELEGRAM_CHAT_ID} \\
            -d text="❌ Jenkins: mygoapp deployment FAILED. Check logs. Commit: ${GIT_COMMIT}"
        '''
      }
    }
  }
}
