#!/usr/bin/env bash
set -e

# Nombre del servicio en Google Cloud Run
SERVICE_NAME="estudio-ipad"
REGION="europe-west1" # o us-central1

echo "=========================================================="
echo "🚀 Desplegando en Google Cloud Run (100% GRATIS Always Free)"
echo "=========================================================="

# Comprobar si gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK ('gcloud') no está instalado."
    echo "Instálalo desde: https://cloud.google.com/sdk/docs/install"
    echo "O sube este proyecto a GitHub y conéctalo en 2 clics a Render.com (100% gratis)."
    exit 1
fi

echo "📦 Compilando y subiendo el contenedor a Cloud Run..."

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars AI_PROVIDER=gemini,GEMINI_API_KEY="$GEMINI_API_KEY",GEMINI_MODEL=gemini-3-flash-preview,PIN_CODE=1234 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2

echo ""
echo "✅ ¡Despliegue completado con éxito!"
echo "Google te dará una URL HTTPS gratuita y segura como: https://estudio-ipad-xxx.a.run.app"
echo "Ábrela en el iPad, pulsa 'Añadir a pantalla de inicio' y ¡a estudiar!"
