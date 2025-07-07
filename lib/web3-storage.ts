import { StoreIndexedDB } from '@web3-storage/w3up-client/stores/indexeddb'
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'

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
  private client: any = null
  private currentSpace: any = null
  private isInitialized = false
  private account: any = null

  async initialize() {
    if (typeof window === "undefined") {
      throw new Error("Web3StorageClient must be used on the client side only.")
    }

    if (this.isInitialized && this.client) return true

    const { create } = await import('@web3-storage/w3up-client')
    const store = new StoreIndexedDB('w3up-client')
    this.client = await create({ store })

    this.isInitialized = true
    console.log('[w3up] Client initialized. Agent DID:', this.client.agent.did())
    return true
  }

  async authenticate(email: string) {
    await this.initialize()
    try {
      this.account = await this.client.login(email)
      console.log('[w3up] ✅ Logged in:', this.account)

      console.log('[w3up] Agent DID:', this.client.agent.did())
      return true
    } catch (error) {
      console.error('Web3StorageClient authenticate error:', error)
      throw error
    }
  }

  async createAndSetSpace() {
    if (!this.account) {
      throw new Error('Not authenticated. Please authenticate first.')
    }

    try {
      const spaces = await this.client.spaces()
      if(spaces.length === 0) 
      {
        const space = await this.client.createSpace(`NFThing_${Date.now().toString().slice(-8)}`,{account: this.account})
        console.log('[w3up] Space created:', space.did())
      }
      else
      {
        this.client.setCurrentSpace(spaces[0].did())
        this.currentSpace = spaces[0]
      }

      console.log('[w3up] Spaces:', spaces)

      return true
    } catch (error) {
      console.error('Web3StorageClient createAndSetSpace error:', error)
      throw error
    }
  }

  async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    await this.initialize()
    try {
      if (!this.currentSpace) throw new Error('No Space set. Authenticate and create or set a Space.')

      const total = file.size
      console.log('[w3up] Uploading file:', file.name)
      const cid = await this.client.uploadFile(file, {
        onShardStored: () => {
          if (onProgress) {
            onProgress({ loaded: total, total, percentage: 100 })
          }
        }
      })

      console.log('[w3up] ✅ Upload complete:', cid.toString())

      return {
        cid: cid.toString(),
          url: `https://${cid.toString()}.ipfs.w3s.link/${file.name}`,
      }
    } catch (error) {
      console.error('Web3StorageClient uploadFile error:', error)
      throw error
    }
  }

  async uploadDirectory(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    await this.initialize()
    try {
      if (!this.currentSpace) throw new Error('No Space set. Authenticate and create or set a Space.')

      const total = files.reduce((acc, file) => acc + file.size, 0)
      console.log('[w3up] Uploading directory:', files)

      const cid = await this.client.uploadDirectory(files, {
        onShardStored: () => {
          if (onProgress) {
            onProgress({ loaded: total, total, percentage: 100 })
          }
        }
      })

      console.log('[w3up] ✅ Directory uploaded:', cid.toString())

      return {
        cid: cid.toString(),
          url: `https://${cid.toString()}.ipfs.w3s.link/`,
      }
    } catch (error) {
      console.error('Web3StorageClient uploadDirectory error:', error)
      throw error
    }
  }

  async uploadJSON(data: any, filename: string): Promise<UploadResult> {
    await this.initialize()
    if (!this.currentSpace) throw new Error('No Space set.')

    const jsonString = JSON.stringify(data, null, 2)
    console.log('[w3up] Uploading JSON:', jsonString)

    const file = new File([jsonString], filename, { type: 'application/json' })
    return this.uploadFile(file)
  }
}

export const web3StorageClient = new Web3StorageClient()
