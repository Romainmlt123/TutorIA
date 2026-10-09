# Surveillant du vocal : image construite depuis la racine du dépôt (render.yaml, dockerContext: .),
# avec seulement le service et la règle de modération qu'il partage avec le serveur intermédiaire.
FROM node:24.13.0-slim

ENV NODE_ENV=production
WORKDIR /app

COPY monitor/package.json monitor/package-lock.json monitor/
RUN npm ci --prefix monitor --omit=dev --ignore-scripts && npm cache clean --force

COPY monitor/main.ts monitor/callMonitor.ts monitor/
COPY server/guards/moderationRules.ts server/guards/

USER node
EXPOSE 8787
# Node 24 exécute le TypeScript directement (types effacés au chargement).
CMD ["node", "monitor/main.ts"]
