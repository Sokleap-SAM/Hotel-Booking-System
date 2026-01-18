import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY', // IMPORTANT: use environment variables in production
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
  }): Promise<User | null> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      return null;
    }
    // you could add more validation logic here
    // for example, checking if the user is active
    return user;
  }
}
