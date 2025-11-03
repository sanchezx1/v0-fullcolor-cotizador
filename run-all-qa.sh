#!/bin/bash
# run-all-qa.sh
# Script para ejecutar todos los agentes de QA en orden

set -e  # Exit on error

# Parse arguments
SKIP_TESTS=false
SKIP_E2E=false
SKIP_SECURITY=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-e2e)
      SKIP_E2E=true
      shift
      ;;
    --skip-security)
      SKIP_SECURITY=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

function write_success { echo -e "${GREEN}✅ $1${NC}"; }
function write_error { echo -e "${RED}❌ $1${NC}"; }
function write_warning { echo -e "${YELLOW}⚠️  $1${NC}"; }
function write_info { echo -e "${CYAN}ℹ️  $1${NC}"; }
function write_section { echo -e "\n${YELLOW}$1${NC}"; }

FAILED=0
START_TIME=$(date +%s)

cat << "EOF"

╔═══════════════════════════════════════════════════════════╗
║     FullColor Cotizador - QA Pipeline Completo           ║
║                                                           ║
║  🧪 Testing Agent  |  ⚡ Performance  |  🔒 Security     ║
╚═══════════════════════════════════════════════════════════╝

EOF

write_info "Iniciando QA Pipeline..."
write_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"

# ==========================================
# 1. Pre-checks
# ==========================================
write_section "🔍 Pre-checks"

write_info "Verificando Node.js..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" == "not found" ]; then
    write_error "Node.js no está instalado"
    exit 1
fi
write_success "Node.js $NODE_VERSION"

write_info "Verificando npm..."
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
if [ "$NPM_VERSION" == "not found" ]; then
    write_error "npm no está instalado"
    exit 1
fi
write_success "npm $NPM_VERSION"

write_info "Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    write_warning "node_modules no existe. Ejecutando npm install..."
    npm install || { write_error "npm install falló"; exit 1; }
fi
write_success "Dependencias instaladas"

# ==========================================
# 2. Testing Agent 🧪
# ==========================================
if [ "$SKIP_TESTS" = false ]; then
    write_section "🧪 Testing Agent"
    
    write_info "Ejecutando tests unitarios..."
    if npm run test:unit; then
        write_success "Tests unitarios pasaron"
    else
        write_error "Tests unitarios fallaron"
        ((FAILED++))
    fi
    
    write_info "Ejecutando tests de integración..."
    if npm run test:integration; then
        write_success "Tests de integración pasaron"
    else
        write_error "Tests de integración fallaron"
        ((FAILED++))
    fi
    
    if [ "$SKIP_E2E" = false ]; then
        write_info "Ejecutando tests E2E..."
        if npm run test:e2e; then
            write_success "Tests E2E pasaron"
        else
            write_error "Tests E2E fallaron"
            ((FAILED++))
        fi
    else
        write_warning "Tests E2E omitidos (--skip-e2e)"
    fi
    
    write_info "Generando reporte de cobertura..."
    if npm run test:coverage -- --silent; then
        write_success "Cobertura alcanzada"
    else
        write_error "Cobertura insuficiente"
        ((FAILED++))
    fi
else
    write_warning "Testing Agent omitido (--skip-tests)"
fi

# ==========================================
# 3. Performance Agent ⚡
# ==========================================
write_section "⚡ Performance Agent"

write_info "Construyendo proyecto..."
if npm run build; then
    write_success "Build exitoso"
    
    # Analizar bundle size
    write_info "Analizando bundle size..."
    BUILD_OUTPUT=$(npm run build 2>&1)
    FIRST_LOAD_JS=$(echo "$BUILD_OUTPUT" | grep -oP "First Load JS.*?(\d+\.?\d*)\s*kB" | grep -oP "\d+\.?\d*" | head -1)
    
    if [ -n "$FIRST_LOAD_JS" ]; then
        if (( $(echo "$FIRST_LOAD_JS > 200" | bc -l) )); then
            write_warning "Bundle size: ${FIRST_LOAD_JS}KB (límite: 200KB)"
        else
            write_success "Bundle size: ${FIRST_LOAD_JS}KB (OK)"
        fi
    else
        write_info "No se pudo extraer bundle size del build output"
    fi
else
    write_error "Build falló"
    ((FAILED++))
fi

# ==========================================
# 4. Security Agent 🔒
# ==========================================
if [ "$SKIP_SECURITY" = false ]; then
    write_section "🔒 Security Agent"
    
    write_info "Ejecutando npm audit..."
    if npm audit --audit-level=moderate 2>&1; then
        write_success "Sin vulnerabilidades críticas"
    else
        write_error "Vulnerabilidades encontradas"
        ((FAILED++))
    fi
    
    write_info "Verificando secretos en .gitignore..."
    if grep -q "\.env\.local" .gitignore 2>/dev/null; then
        write_success ".env.local está en .gitignore"
    else
        write_error ".env.local NO está en .gitignore"
        ((FAILED++))
    fi
    
    write_info "Verificando TypeScript strict mode..."
    if grep -q '"strict":\s*true' tsconfig.json 2>/dev/null; then
        write_success "TypeScript strict mode activo"
    else
        write_warning "TypeScript strict mode no detectado"
    fi
    
    write_info "Ejecutando TypeScript check..."
    if npx tsc --noEmit; then
        write_success "Sin errores de TypeScript"
    else
        write_error "Errores de TypeScript encontrados"
        ((FAILED++))
    fi
    
    write_info "Ejecutando linter..."
    if npm run lint; then
        write_success "Linter pasó"
    else
        write_warning "Advertencias de linter encontradas"
    fi
else
    write_warning "Security Agent omitido (--skip-security)"
fi

# ==========================================
# 5. Summary
# ==========================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "\n${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                      RESUMEN                              ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GRAY}Duración: ${MINUTES}m ${SECONDS}s${NC}"

if [ $FAILED -eq 0 ]; then
    cat << "EOF"

    ✅✅✅ TODOS LOS CHECKS PASARON ✅✅✅
    
    El proyecto está listo para producción! 🚀
    
EOF
    exit 0
else
    cat << EOF

    ❌❌❌ $FAILED CHECK(S) FALLARON ❌❌❌
    
    Por favor corrige los errores antes de deployar.
    
    Ver logs arriba para detalles.
    
EOF
    exit 1
fi
