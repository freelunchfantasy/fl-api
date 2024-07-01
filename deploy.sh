LATEST_SHA=$(git rev-parse HEAD)
docker build -t freelunch-api-qa:$LATEST_SHA .
docker tag freelunch-api-qa:$LATEST_SHA 905418381743.dkr.ecr.us-east-2.amazonaws.com/freelunch-api-qa:$LATEST_SHA
docker push 905418381743.dkr.ecr.us-east-2.amazonaws.com/freelunch-api-qa:$LATEST_SHA
kubectl set image deployment/freelunch-api-qa freelunch-api-qa=905418381743.dkr.ecr.us-east-2.amazonaws.com/freelunch-api-qa:$LATEST_SHA -n default