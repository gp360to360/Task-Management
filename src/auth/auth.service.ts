import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuthCredentialDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService) {}

  async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    return this.usersRepository.createUser(authCredentialDto);
  }

  async signIn(authCredentialDto: AuthCredentialDto): Promise<{accessToken: string}> {
    const { username, password } = authCredentialDto;
    const user = await this.usersRepository.findOne({where: {username} });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {username};
      const accessToken: string = await this.jwtService.sign(payload);
      return {accessToken};
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
