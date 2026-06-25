import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Keypair } from '@stellar/stellar-sdk';
import { UsersService } from '../users/users.service';
import { VerifyAuthDto } from './dto/verify-auth.dto';

export interface AuthResult {
  accessToken: string;
}

@Injectable()
export class AuthService {
  private readonly nonces = new Map<
    string,
    { value: string; expiresAt: number }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async verify(dto: VerifyAuthDto): Promise<AuthResult> {
    const nonceEntry = this.nonces.get(dto.publicKey);

    if (!nonceEntry || nonceEntry.expiresAt < Date.now()) {
      this.nonces.delete(dto.publicKey);
      throw new UnauthorizedException('Nonce expired or not found');
    }

    if (nonceEntry.value !== dto.nonce) {
      throw new UnauthorizedException('Invalid nonce');
    }

    if (!this.verifySignature(dto.publicKey, dto.nonce, dto.signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    this.nonces.delete(dto.publicKey);

    const accessToken = this.jwtService.sign({
      sub: dto.publicKey,
    });

    return { accessToken };
  }

  createNonce(publicKey: string): string {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.nonces.set(publicKey, {
      value: nonce,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return nonce;
  }

  verifySignature(
    publicKey: string,
    message: string,
    signature: string,
  ): boolean {
    if (!publicKey || !message || !signature) {
      return false;
    }

    try {
      return Keypair.fromPublicKey(publicKey).verify(
        Buffer.from(message),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }
}
