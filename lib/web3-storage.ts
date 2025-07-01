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
      if (typeof window === "undefined") {
        throw new Error("Web3StorageClient must be used on the client side only.")
      }
  
      if (this.isInitialized && this.client) return true
  
      const { create } = await import('@web3-storage/w3up-client')
  
      this.client = await create()
      this.isInitialized = true
      return true
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
      await this.initialize()
      if (!this.currentSpace) throw new Error('Not authenticated. Please authenticate first.')
  
      const total = file.size
      const cid = await this.client.uploadFile(file, {
        onShardStored: () => {
          if (onProgress) {
            onProgress({ loaded: total, total, percentage: 100 })
          }
        }
      })
  
      return {
        cid: cid.toString(),
        url: `https://${cid.toString()}.ipfs.w3s.link/${file.name}`,
      }
    }
  
    async uploadDirectory(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
      await this.initialize()
      if (!this.currentSpace) throw new Error('Not authenticated. Please authenticate first.')
  
      const total = files.reduce((acc, file) => acc + file.size, 0)
      const cid = await this.client.uploadDirectory(files, {
        onShardStored: () => {
          if (onProgress) {
            onProgress({ loaded: total, total, percentage: 100 })
          }
        }
      })
  
      return {
        cid: cid.toString(),
        url: `https://${cid.toString()}.ipfs.w3s.link/`,
      }
    }
  
    async uploadJSON(data: any, filename: string): Promise<UploadResult> {
      const jsonString = JSON.stringify(data, null, 2)
      const file = new File([jsonString], filename, { type: 'application/json' })
      return this.uploadFile(file)
    }
  }
  
  export const web3StorageClient = new Web3StorageClient()
  