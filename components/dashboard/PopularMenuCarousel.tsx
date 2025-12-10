"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import Image from "next/image"

interface PopularMenuProps {
    menus: {
        name: string
        quantity: number
        image?: string
    }[]
}

export function PopularMenuCarousel({ menus }: PopularMenuProps) {
    if (menus.length === 0) return (
        <div className="text-center py-8 text-muted-foreground text-sm">No sales data yet</div>
    )

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {menus.map((menu, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="min-w-[200px] snap-start"
                >
                    <Card className="h-full bg-coffee-dark border-white/10 overflow-hidden hover:border-coffee-gold/50 transition-colors group">
                        <CardContent className="p-0">
                            <div className="h-24 bg-gradient-to-b from-white/5 to-transparent relative flex items-center justify-center overflow-hidden">
                                 {/* Placeholder for no image case, usually you would have menu.image */}
                                 <div className="absolute inset-0 bg-coffee-gold/10 group-hover:bg-coffee-gold/20 transition-colors" />
                                 <span className="text-4xl">☕</span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-coffee-cream truncate">{menu.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{menu.quantity} Sold</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
