import { motion, AnimatePresence } from "framer-motion";

type Props = {
    count: number;
};

export default function OnlineBadge({ count }: Props) {
    return (
        <div
            className="flex items-center min-h-[48px] gap-2 px-4 py-2 font-extrabold shadow-2xl rounded-xl
                 bg-gradient-to-br from-slate-600/80 via-slate-900/90 to-black/70
                 border border-white/10 shadow-lg shadow-black/40
                 backdrop-blur-md select-none"
        >
            {/* Пульс-точка */}
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400"></span>
            </div>

            {/* текст */}
            <div className="flex items-center gap-2">
                <span className="uppercase text-[13px] text-green-400 leading-1">
                    Online:
                </span>

                {/* Анимация смены числа */}
                <div>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={count}
                        initial={{ y: 10, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -10, opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25 }}
                        className="text-lg text-white drop-shadow"
                    >
                        <span className="inline-block text-[15px] leading-1">{count}</span>
                    </motion.span>
                </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
