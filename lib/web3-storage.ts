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
    private spaceName: string | null = null
    private account: any = null
  
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
      try {
        this.account = await this.client.login(email)
        console.log('Account:', this.account)
        return true
      } catch (error) {
        console.error('Web3StorageClient authenticate error:', error)
        throw error
      }
    }
  
    async createAndSetSpace() {
      try {
      if (!this.account) throw new Error('Not authenticated. Please authenticate first.')
      const space = await this.client.createSpace(`NFThing_${Date.now().toString().slice(-8)}`, { skipGatewayAuthorization: true, account: this.account })
      await this.client.setCurrentSpace(space.did())
        this.currentSpace = space
        console.log('Space created:', space)
        return true
      } catch (error) {
        console.error('Web3StorageClient createAndSetSpace error:', error)
        throw error
      }
    }
  
    async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
      await this.initialize()
      if (!this.currentSpace) throw new Error('Not authenticated. Please authenticate first.')
  
      const total = file.size
      try {
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
      } catch (error) {
        console.error('Web3StorageClient uploadFile error:', error)
        throw error
      }
    }
  
    async uploadDirectory(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
      try {
      await this.initialize()
      if (!this.currentSpace) throw new Error('Not authenticated. Please authenticate first.')
  
      const total = files.reduce((acc, file) => acc + file.size, 0)
      console.log('Uploading directory:', files)
      const cid = await this.client.uploadDirectory(files, {
        onShardStored: () => {
          if (onProgress) {
            onProgress({ loaded: total, total, percentage: 100 })
          }
        }
      })
      console.log('Directory uploaded:', cid)
  
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
      try {
        const jsonString = JSON.stringify(data, null, 2)
        console.log('Uploading JSON:', jsonString)
        const file = new File([jsonString], filename, { type: 'application/json' })
        console.log('File created:', file)
        return this.uploadFile(file)
      } catch (error) {
        console.error('Web3StorageClient uploadJSON error:', error)
        throw error
      }
    }
  }
  
  export const web3StorageClient = new Web3StorageClient()
  