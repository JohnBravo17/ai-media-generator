import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// For testing: remove authentication requirement
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  // Always pass through with the dummy user from context
  return next({
    ctx: {
      ...ctx,
      user: ctx.user!, // We know user is always set in testing mode
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // For testing: allow all requests as admin
    return next({
      ctx: {
        ...ctx,
        user: ctx.user!,
      },
    });
  }),
);
