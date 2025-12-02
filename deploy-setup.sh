#!/bin/bash

# 🚀 Script de Deploy - Ayra
# Este script ajuda a preparar o projeto para deploy na Vercel

echo "🚀 Preparando Ayra para Deploy na Vercel..."
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto Ayra"
    exit 1
fi

# Verificar se Git está inicializado
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositório Git..."
    git init
    echo "✅ Git inicializado"
else
    echo "✅ Git já está inicializado"
fi

# Verificar se há arquivos para commit
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "📝 Arquivos modificados encontrados:"
    git status --short
    echo ""
    read -p "Deseja fazer commit destes arquivos? (s/n): " commit_choice
    
    if [ "$commit_choice" = "s" ] || [ "$commit_choice" = "S" ]; then
        git add .
        read -p "Digite a mensagem do commit: " commit_message
        git commit -m "$commit_message"
        echo "✅ Commit realizado"
    fi
else
    echo "✅ Nenhuma alteração para commit"
fi

# Verificar se remote está configurado
if ! git remote | grep -q "origin"; then
    echo ""
    echo "🔗 Configurar repositório remoto do GitHub"
    echo ""
    read -p "Digite seu username do GitHub: " github_user
    read -p "Digite o nome do repositório (padrão: ayra): " repo_name
    repo_name=${repo_name:-ayra}
    
    git remote add origin "https://github.com/$github_user/$repo_name.git"
    echo "✅ Remote configurado: https://github.com/$github_user/$repo_name.git"
    echo ""
    echo "⚠️  Certifique-se de criar o repositório no GitHub antes de fazer push!"
    echo "   Acesse: https://github.com/new"
else
    echo "✅ Remote já está configurado"
    git remote -v
fi

# Verificar branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo ""
    read -p "Branch atual é '$current_branch'. Renomear para 'main'? (s/n): " rename_choice
    if [ "$rename_choice" = "s" ] || [ "$rename_choice" = "S" ]; then
        git branch -M main
        echo "✅ Branch renomeada para 'main'"
    fi
fi

echo ""
echo "✅ Preparação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Crie o repositório no GitHub: https://github.com/new"
echo "2. Execute: git push -u origin main"
echo "3. Acesse a Vercel: https://vercel.com"
echo "4. Importe o repositório do GitHub"
echo "5. Configure as variáveis de ambiente do Supabase"
echo "6. Faça o deploy!"
echo ""
echo "📚 Guia completo: .agent/workflows/deploy-vercel.md"
echo "📝 Checklist: DEPLOY_CHECKLIST.md"
echo ""
