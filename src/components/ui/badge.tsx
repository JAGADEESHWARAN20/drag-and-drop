"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { badgeVariants, BadgeVariants } from "./badgeVarients";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  BadgeVariants { }

const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

export { Badge };
