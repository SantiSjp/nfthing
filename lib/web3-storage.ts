import { create } from '@web3-storage/w3up-client'

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

  async initialize() {
    try {
      if (this.isInitialized && this.client) return true
      this.client = await create()
      this.isInitialized = true
      return true
    } catch (error) {
      console.error("Failed to initialize Web3.Storage client:", error)
      throw new Error("Failed to initialize Web3.Storage client")
    }
  }

  async authenticate(email: string) {
    await this.initialize()
    await this.client.authorize(email)
    const spaces = this.client.spaces()
    if (!spaces || spaces.length === 0) {
      const space = await this.client.createSpace('NFT Layer Composer')
      await this.client.setCurrentSpace(space.did())
      await this.client.registerSpace(email)
      this.currentSpace = space
    } else {
      this.currentSpace = spaces[0]
      await this.client.setCurrentSpace(this.currentSpace.did())
    }
    return true
  }

  async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    try{
      await this.initialize()
      if (!this.currentSpace) throw new Error('Not authenticated. Please authenticate first.')
      let loaded = 0
      const total = file.size
      const cid = await this.client.uploadFile(file, {
        onShardStored: (meta: any) => {
          loaded = total
          if (onProgress) {
            onProgress({ loaded, total, percentage: 100 })
          }
        }
      })
      return {
        cid: cid.toString(),
        url: `https://${cid.toString()}.ipfs.w3s.link/${file.name}`,
      }
    }catch(error){
      console.error("Failed to upload file:", error)
      throw new Error("Failed to upload file")
    }
  }

  async uploadDirectory(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    try{
      await this.initialize()
      if (!this.currentSpace) throw new Error('Not authenticated. Please authenticate first.')
      let loaded = 0
      const total = files.reduce((acc, file) => acc + file.size, 0)
      const cid = await this.client.uploadDirectory(files, {
        onShardStored: (meta: any) => {
          loaded = total
          if (onProgress) {
            onProgress({ loaded, total, percentage: 100 })
          }
        }
      })
      return {
        cid: cid.toString(),
        url: `https://${cid.toString()}.ipfs.w3s.link/`,
      }
    }catch(error){
      console.error("Failed to upload directory:", error)
      throw new Error("Failed to upload directory")
    }
  }

  async uploadJSON(data: any, filename: string): Promise<UploadResult> {
    try{
      const jsonString = JSON.stringify(data, null, 2)
      const file = new File([jsonString], filename, { type: 'application/json' })
      return this.uploadFile(file)
    }catch(error){
      console.error("Failed to upload JSON:", error)
      throw new Error("Failed to upload JSON")
    }
  }
}

export const web3StorageClient = new Web3StorageClient()
