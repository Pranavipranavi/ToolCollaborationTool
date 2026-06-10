import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";

async function ensureDefaultWorkspace(user) {
  const existingWorkspace = await Workspace.exists({ "members.user": user._id });
  if (existingWorkspace) return;

  await Workspace.create({
    name: `${user.name}'s Workspace`,
    description: "Your TaskFlow workspace",
    owner: user._id,
    inviteCode: crypto.randomBytes(8).toString("hex"),
    members: [{ user: user._id, role: "Owner" }],
  });
}

function makeUsername(email) {
  const base = String(email).split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "user";
  return `${base}-${crypto.randomBytes(4).toString("hex")}`;
}

async function upsertOAuthUser({ provider, providerId, email, name, avatar }) {
  if (!email) {
    throw new Error(`${provider} account did not provide an email address`);
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, username: makeUsername(email), name, avatar, providers: { [provider]: providerId } });
  } else {
    user.providers = { ...user.providers, [provider]: providerId };
    user.avatar = user.avatar || avatar;
    await user.save();
  }
  await ensureDefaultWorkspace(user);
  return user;
}

if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const user = await upsertOAuthUser({ provider: "google", providerId: profile.id, email, name: profile.displayName, avatar: profile.photos?.[0]?.value });
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

export { passport };
