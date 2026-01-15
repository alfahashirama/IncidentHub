#!/bin/bash
set -e

echo "🚀 Déploiement IncidentHub sur Minikube"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Pull les dernières images
echo -e "${BLUE}📦 Pull des dernières images depuis Docker Hub...${NC}"
docker pull alfa2003/incidenthub-backend:latest
docker pull alfa2003/incidenthub-frontend:latest

# Redéploie sur Kubernetes
echo -e "${BLUE}♻️  Redéploiement sur Kubernetes...${NC}"
kubectl rollout restart deployment/backend -n incidenthub
kubectl rollout restart deployment/frontend -n incidenthub

# Attends que les pods soient prêts
echo -e "${BLUE}⏳ Attente du redémarrage des pods...${NC}"
kubectl wait --for=condition=ready pod -l app=backend -n incidenthub --timeout=180s
kubectl wait --for=condition=ready pod -l app=frontend -n incidenthub --timeout=180s

# Affiche le statut
echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
kubectl get pods -n incidenthub

echo ""
echo -e "${GREEN}📝 N'oublie pas de relancer les port-forwards :${NC}"
echo "   Terminal 1: kubectl port-forward -n incidenthub svc/backend 5000:5000"
echo "   Terminal 2: kubectl port-forward -n incidenthub svc/frontend 8081:80"
echo ""