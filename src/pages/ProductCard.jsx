import React from "react";

export default function ProductCard({
    product,
    cartQuantity,
    stock,
    onAddToCart,
    onIncreaseQuantity,
    onDecreaseQuantity,
    showCategory = false, // New prop to control category display
}) {
    if (!product) return null;

    const isOutOfStock = stock <= 0;
    const canIncrease = cartQuantity < stock;

    return (
        <div className="
            bg-secondary
            rounded-xl
            border border-border
            p-5
            flex
            flex-col
            transition-all
            duration-200
            hover:scale-[1.02]
            hover:shadow-lg
            hover:shadow-accent/10
            relative
            overflow-hidden
        ">
            {isOutOfStock && (
                <div className="absolute top-3 right-3 z-10">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                        Out of Stock
                    </span>
                </div>
            )}

            <div className="flex-grow">
                {/* Category badge - positioned inside the card header */}
                {showCategory && product.category && (
                    <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 bg-primary bg-opacity-20 text-primary text-xs font-medium rounded-full">
                            {product.category}
                        </span>
                    </div>
                )}
                
                <h2 className="text-xl font-bold text-primary mb-2">{product.name}</h2>
                
                <p className="text-secondary text-sm mb-4 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <p className="text-accent font-bold text-2xl">
                            ${Number(product.price).toFixed(2)}
                        </p>
                        <p className="text-secondary text-sm mt-1">
                            {isOutOfStock ? (
                                <span className="text-red-400">Out of stock</span>
                            ) : (
                                <span>{stock} in stock</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
                {cartQuantity > 0 ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onDecreaseQuantity}
                                disabled={isOutOfStock}
                                className="
                                    w-8 h-8
                                    flex items-center justify-center
                                    rounded-lg
                                    bg-primary bg-opacity-20
                                    text-primary
                                    hover:bg-opacity-30
                                    disabled:opacity-30 disabled:cursor-not-allowed
                                    transition
                                "
                            >
                                -
                            </button>

                            <span className="text-primary font-semibold text-lg min-w-8 text-center">
                                {cartQuantity}
                            </span>

                            <button
                                onClick={onIncreaseQuantity}
                                disabled={isOutOfStock || !canIncrease}
                                className="
                                    w-8 h-8
                                    flex items-center justify-center
                                    rounded-lg
                                    bg-primary bg-opacity-20
                                    text-primary
                                    hover:bg-opacity-30
                                    disabled:opacity-30 disabled:cursor-not-allowed
                                    transition
                                "
                            >
                                +
                            </button>
                        </div>
                        
                        <div className="text-right">
                            <p className="text-primary font-bold text-lg">
                                ${(Number(product.price) * cartQuantity).toFixed(2)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onAddToCart}
                        disabled={isOutOfStock}
                        className="
                            w-full
                            py-3
                            bg-accent
                            text-white
                            rounded-lg
                            font-semibold
                            transition-all
                            duration-200
                            hover:bg-white
                            hover:text-black
                            disabled:bg-gray-600
                            disabled:text-gray-400
                            disabled:cursor-not-allowed
                        "
                    >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                )}
            </div>
        </div>
    );
}