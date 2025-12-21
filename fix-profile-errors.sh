#!/bin/bash

# Corrige erros de TypeScript relacionados a profile

# MetasPage.tsx - linha 12
sed -i '' '12s/const { user, profile } = useAuth();/const { user } = useAuth();/' src/pages/MetasPage.tsx

# PremiumPage.tsx - linha 7-8
sed -i '' '7s/const { user } = useAuth();//' src/pages/PremiumPage.tsx
sed -i '' '8s/const isPremium = profile?.plano === .premium.;/const { user } = useAuth();\n    const isPremium = user?.plano === "premium";/' src/pages/PremiumPage.tsx

# Profile.tsx - linha 6
sed -i '' '6s/const { user, profile, signOut } = useAuth();/const { user, signOut } = useAuth();/' src/pages/Profile.tsx

# RankingPage.tsx - linha 16
sed -i '' '16s/const { user } = useAuth();//' src/pages/RankingPage.tsx
sed -i '' '26s/const userName = profile?.nome || .Atleta.;/const userName = "Atleta";/' src/pages/RankingPage.tsx

echo "Correções aplicadas!"
