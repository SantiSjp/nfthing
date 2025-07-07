import { delegate } from '@ucanto/core/delegation'
import * as Signer from '@ucanto/principal/ed25519'
import fs from 'node:fs'

// 1️⃣ Seu agent
const issuer = Signer.parse('<PRIVATE_KEY_AQUI>')
// 2️⃣ Audience pode ser o próprio agent, ou o `space` DID se for separado
const audience = issuer

const delegation = await delegate({
  issuer,
  audience,
  capabilities: [
    { can: 'space/*', with: issuer.did() },
    { can: 'upload/*', with: issuer.did() },
    { can: 'blob/*', with: issuer.did() },
    { can: 'filecoin/*', with: issuer.did() }
  ]
})

// 🔥 Empacota como CAR de verdade
const { ok: carBytes, error } = await delegation.archive()
if (error) throw error

fs.writeFileSync('proof.car', carBytes)
console.log('✅ proof.car gerado com', carBytes.length, 'bytes')
