docker build -t backend:latest .
docker tag backend:latest us-central1-docker.pkg.dev/routerite-460619/backend-deploys/backend:latest
docker push us-central1-docker.pkg.dev/routerite-460619/backend-deploys/backend