import * as Web3Client from '@web3-storage/w3up-client'
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'
import * as Proof from '@web3-storage/w3up-client/proof'
import { Signer } from '@web3-storage/w3up-client/principal/ed25519'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  cid: string
  url: string
}

class Web3StorageClient {
  private isInitialized = false
  private client: Web3Client.Client | undefined

  async initialize() {
    if (typeof window === "undefined") {
      throw new Error("Web3StorageClient must be used on the client side only.")
    }

    if (this.isInitialized) return true

    try{
      const principal = Signer.parse(process.env.NEXT_PUBLIC_KEY!)
      console.log('[w3up] Principal:', principal)
      const client = await Web3Client.create({ principal})          
      
      this.client = client
      this.isInitialized = true 
      console.log('[w3up] Client initialized. Agent DID:', client.agent.did())
      return true
    }catch(error){
      console.error('[w3up] Error initializing client:', error)
      throw error
    }
  }

  async InitSpace(){
    await this.initialize()
    if (!this.client) throw new Error('Client not initialized. Call initialize() first.')

    const proof = await Proof.parse(process.env.NEXT_PUBLIC_PROOF!)
    console.log('[w3up] Proof:', proof)

    const space = await this.client?.addSpace(proof)
    console.log('[w3up] Space:', space)
    await this.client?.setCurrentSpace(space!.did())
    console.log('[w3up] Current Space:', this.client?.currentSpace())
    return true
  }

  async uploadFile(file: File): Promise<UploadResult> {
    await this.initialize()
    try {
      if (!this.client) throw new Error('Client not initialized. Call initialize() first.')
      console.log('[w3up] Uploading file:', file.name)
      const cid = await this.client?.uploadFile(file)
      console.log('[w3up] ✅ Upload complete:', cid?.toString())      

      return {
        cid: cid!.toString(),
          url: `https://${cid!.toString()}.ipfs.w3s.link`,
      }
    } catch (error) {
      console.error('Web3StorageClient uploadFile error:', error)
      throw error
    }
  }

  async uploadDirectory(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    await this.initialize()
    try {
      if (!this.client?.currentSpace())throw new Error('No Space set. Authenticate and create or set a Space.')

      const total = files.reduce((acc, file) => acc + file.size, 0)
      console.log('[w3up] Uploading directory:', files)

      const cid = await this.client?.uploadDirectory(files, {
        onShardStored: () => {
          if (onProgress) {
            onProgress({ loaded: total, total, percentage: 100 })
          }
        }
      })

      console.log('[w3up] ✅ Directory uploaded:', cid!.toString())
      

      return {
        cid: cid!.toString(),
          url: `https://${cid!.toString()}.ipfs.w3s.link/`,
      }
    } catch (error) {
      console.error('Web3StorageClient uploadDirectory error:', error)
      throw error
    }
  }

  async uploadJSON(data: any, filename: string): Promise<UploadResult> {
    await this.initialize()

    const jsonString = JSON.stringify(data, null, 2)
    console.log('[w3up] Uploading JSON:', jsonString)

    const file = new File([jsonString], filename, { type: 'application/json' })
    return this.uploadFile(file)
  }  
}

export const web3StorageClient = new Web3StorageClient()
