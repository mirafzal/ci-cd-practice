pipeline {
  agent { label 'jenkins-agent' }

  triggers {
    pollSCM('* * * * *') // optional: check repo every minute
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm // uses the repo Jenkins pulled the Jenkinsfile from
      }
    }

    stage('Build') {
      steps {
        sh 'echo "Building app..."'
      }
    }

    stage('Test') {
      steps {
        sh 'echo "Running tests..."'
      }
    }

    stage('Deploy') {
      steps {
        sh 'echo "Deploying..."'
      }
    }
  }

  post {
    success {
      echo '✅ Build and deployment succeeded!'
    }
    failure {
      echo '❌ Build failed!'
    }
  }
}
