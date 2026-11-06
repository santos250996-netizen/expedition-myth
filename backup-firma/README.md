# backup-firma · Copia cifrada de la keystore de Ecos del Olimpo

`ecos-del-olimpo.jks.enc` es la keystore de firma de la app **cifrada con
AES-256-CBC (PBKDF2, 200.000 iteraciones)**. El repositorio es público, por
eso el archivo está cifrado: sin la contraseña es inútil para cualquiera.

- Alias: `ecosdelolimpo`
- Huella SHA-256 del certificado:
  `E5:AE:10:14:A8:69:49:72:A0:91:5A:6F:AB:A8:4F:93:39:91:17:79:61:D0:06:67:F5:0C:80:7C:9E:52:19:EC`
- Contraseña: **no está en este repositorio**. Guárdala tú en tu gestor de
  contraseñas (te la facilitó Zeta junto a este aviso) y no la pierdas: si
  desaparece la contraseña Y este archivo, ya no podrás publicar
  actualizaciones de la app sobre las instalaciones existentes.

## Cómo descargarla al móvil

1. Abre github.com en el navegador (con tu sesión iniciada) y entra en
   `santos250996-netizen/expedition-myth` → carpeta `backup-firma`.
2. Toca `ecos-del-olimpo.jks.enc` → botón de descarga (o "Raw" y guardar).
3. Copia también la contraseña desde tu gestor de contraseñas.

## Cómo descifrar (recuperar la .jks)

Con OpenSSL (en el móvil con Termux, o en un ordenador):

    openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
      -in ecos-del-olimpo.jks.enc -out ecos-del-olimpo.jks \
      -pass pass:TU_CONTRASEÑA

Verifica la huella tras descifrar:

    keytool -list -v -keystore ecos-del-olimpo.jks

## Cómo se usa en CI

GitHub Actions no usa este archivo: decodifica la keystore desde el secret
`ANDROID_KEYSTORE_BASE64` (en claro, dentro del almacén cifrado de secrets
de GitHub). Este backup es tu copia de seguridad personal y descargable.
