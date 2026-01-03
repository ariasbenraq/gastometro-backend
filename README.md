# gastometro-backend

## Usuario admin inicial

La migración `1723000000000-seed-admin-role-user.ts` inserta los roles
`ADMIN`, `ANALYST_BALANCE` y `USER`, además de crear el usuario admin con:

- Usuario: `admin`
- Email: `admin@gastometro.local`
- Password hash: BCrypt (ver abajo para regenerarlo)

### Regenerar el hash del password admin

1. Ejecuta en tu entorno local:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('TU_PASSWORD_ADMIN', 10).then(h=>console.log(h));"
```

2. Copia el hash generado y actualiza la migración
`src/migrations/1723000000000-seed-admin-role-user.ts` en el campo
`password_hash`.
