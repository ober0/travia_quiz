import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
    async status() {
        return {
            status: 'active'
        }
    }
}
