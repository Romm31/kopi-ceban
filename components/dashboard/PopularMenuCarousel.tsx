"use client"

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
        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menus.map((menu, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-card p-4 rounded-xl shadow-sm border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col items-center gap-3"
                >
                    {/* Menu Image */}
                    <div className="relative w-36 h-36 rounded-lg overflow-hidden shadow-md">
                        {menu.image ? (
                            <Image
                                src={menu.image}
                                alt={menu.name}
                                fill
                                className="object-cover"
                                sizes="144px"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
                                <span className="text-5xl">☕</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Menu Info */}
                    <div className="text-center mt-1">
                        <h3 className="text-foreground font-semibold text-base text-center truncate max-w-[160px]">
                            {menu.name}
                        </h3>
                        <p className="text-muted-foreground text-sm text-center mt-1">
                            {menu.quantity} Sold
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
