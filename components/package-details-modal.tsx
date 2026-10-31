"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Boxes,
  Scale,
  Maximize2,
  ShoppingBag
} from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";

export function PackageDetailsModal({
  isOpen,
  onClose,
  order
}: {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}) {
  const items = order?.items || [];
  const productDetails = order?.productDetails || [];
  const rawItems = Array.isArray(productDetails) ? productDetails : (productDetails?.line_items || []);

  let totalDeadWeight = 0;
  if (items.length > 0) {
    totalDeadWeight = items.reduce((acc: number, item: any) => acc + (Number(item.weight || 0) * Number(item.qty || item.quantity || 1)), 0);
  }
  const rootDeadWeight = order?.shipment?.deadWeight ?? order?.shipment?.dead_weight ?? order?.shipment?.weight ?? order?.deadWeight ?? order?.dead_weight ?? order?.weight;
  if (rootDeadWeight !== undefined && rootDeadWeight !== null && Number(rootDeadWeight) > 0) {
    totalDeadWeight = Number(rootDeadWeight);
  }

  let totalVolWeight = 0;
  if (items.length > 0) {
    totalVolWeight = items.reduce((acc: number, item: any) => {
      if (item.length && item.breadth && item.height) {
        return acc + ((Number(item.length) * Number(item.breadth) * Number(item.height)) / 5000) * Number(item.qty || item.quantity || 1);
      }
      return acc;
    }, 0);
  }
  const rootVolWeight = order?.shipment?.volWeight ?? order?.shipment?.vol_weight ?? order?.shipment?.volumetricWeight ?? order?.volWeight ?? order?.vol_weight ?? order?.volumetricWeight;
  if (rootVolWeight !== undefined && rootVolWeight !== null && Number(rootVolWeight) > 0) {
    totalVolWeight = Number(rootVolWeight);
  }

  const totalItemsCount = items.length > 0
    ? items.reduce((acc: number, item: any) => acc + Number(item.qty || item.quantity || 1), 0)
    : 1;

  const orderNum = order?.customerOrderNumber || order?.orderNumber || order?.id || "N/A";
  const orderDate = order?.placedAt || order?.createdAt;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden shadow-xl rounded-2xl animate-in fade-in-90 zoom-in-95 duration-150">
        {/* Compact Header */}
        <DialogHeader className="px-4 py-2.5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5 pr-6">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
              <Package className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Package Details
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                <span>Order:</span>
                <span className="font-mono bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 px-1 py-0.2 rounded text-[10px] font-bold">
                  #{orderNum}
                </span>
                {orderDate && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span>{new Date(orderDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {/* Weight & Dimension Cards Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Card 1: Total Items */}
            <div className="bg-blue-50/40 dark:bg-blue-950/15 p-2 rounded-lg border border-blue-100/80 dark:border-blue-900/40 flex items-center gap-2">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md shrink-0">
                <Boxes className="h-3 w-3" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[8.5px] text-blue-600/90 dark:text-blue-400/90 font-bold uppercase tracking-wider truncate">Total Items</p>
                <p className="text-xs font-extrabold text-blue-900 dark:text-blue-200 mt-0.5">{totalItemsCount}</p>
              </div>
            </div>

            {/* Card 2: Dead Weight */}
            <div className="bg-emerald-50/40 dark:bg-emerald-950/15 p-2 rounded-lg border border-emerald-100/80 dark:border-emerald-900/40 flex items-center gap-2">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-md shrink-0">
                <Scale className="h-3 w-3" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[8.5px] text-emerald-600/90 dark:text-emerald-400/90 font-bold uppercase tracking-wider truncate">Dead Wt</p>
                <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">
                  {totalDeadWeight > 0 ? `${totalDeadWeight.toFixed(2)} kg` : '0.00 kg'}
                </p>
              </div>
            </div>

            {/* Card 3: Volumetric Weight */}
            <div className="bg-purple-50/40 dark:bg-purple-950/15 p-2 rounded-lg border border-purple-100/80 dark:border-purple-900/40 flex items-center gap-2">
              <div className="p-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-md shrink-0">
                <Maximize2 className="h-3 w-3" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[8.5px] text-purple-600/90 dark:text-purple-400/90 font-bold uppercase tracking-wider truncate">Vol Wt</p>
                <p className="text-xs font-extrabold text-purple-900 dark:text-purple-200 mt-0.5">
                  {totalVolWeight > 0 ? `${totalVolWeight.toFixed(2)} kg` : '0.00 kg'}
                </p>
              </div>
            </div>
          </div>

          {/* Item Contents List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1">
              <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <ShoppingBag className="h-3 w-3 text-blue-600" />
                <span>Item Contents</span>
                <span className="text-[10px] font-normal text-zinc-500">({items.length > 0 ? items.length : 1} item)</span>
              </h4>
            </div>

            <div className="space-y-1.5">
              {items.length > 0 ? (
                items.map((item: any, idx: number) => {
                  const rawMatch = rawItems.find((r: any) => r.sku === (item.sku || item.productSku) || r.id?.toString() === item.id?.toString());
                  const rawImageUrl =
                    item.imageUrl ||
                    item.image ||
                    item.productImage ||
                    item.product?.imageUrl ||
                    item.product?.image1 ||
                    item.product?.image2 ||
                    item.product?.image ||
                    item.product?.SKUMediaItem?.[0]?.media?.mediaUrl ||
                    item.product?.ProductMediaItem?.[0]?.media?.mediaUrl ||
                    rawMatch?.image?.src ||
                    rawMatch?.image ||
                    null;
                  const imageUrl = resolveImageUrl(rawImageUrl);
                  const qty = item.qty || item.quantity || 1;
                  const unitPrice = Number(item.unitPrice ?? item.price ?? rawMatch?.price ?? 0);
                  const totalItemPrice = item.totalAmount && Number(item.totalAmount) > 0
                    ? Number(item.totalAmount)
                    : unitPrice * qty;

                  return (
                    <div
                      key={idx}
                      className="flex gap-2.5 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 items-start"
                    >
                      {/* Image Frame */}
                      <div className="w-10 h-10 shrink-0 bg-zinc-50 dark:bg-zinc-800 rounded-md overflow-hidden border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center relative">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.productName || item.name || 'product'} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>

                      {/* Info details */}
                      <div className="flex-1 flex flex-col min-w-0 text-left">
                        <p className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {item.productName || item.name}
                        </p>
                        {item.variantName && item.variantName !== 'Default' && (
                          <p className="text-[9.5px] font-medium text-zinc-500">{item.variantName}</p>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                            Qty: {qty}
                          </span>
                          <span className="inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-mono bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                            SKU: {item.sku || item.productSku || 'N/A'}
                          </span>
                          {item.weight && (
                            <span className="inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
                              Wt: {item.weight} kg
                            </span>
                          )}
                          {item.length && item.breadth && item.height && !(Number(item.length) === 10 && Number(item.breadth) === 10 && Number(item.height) === 10) && (
                            <span className="inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30">
                              Dims: {item.length}×{item.breadth}×{item.height} cm
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing details */}
                      {totalItemPrice > 0 && (
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-[11px] text-zinc-900 dark:text-zinc-100">
                            ₹{totalItemPrice.toLocaleString("en-IN")}
                          </p>
                          {qty > 1 && (
                            <p className="text-[8.5px] text-zinc-500 font-medium">
                              ₹{unitPrice.toLocaleString("en-IN")} ea
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                /* Fallback card for single-package items without detailed line-items */
                <div className="flex gap-2.5 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 items-start">
                  <div className="w-9 h-9 shrink-0 bg-blue-50 dark:bg-blue-950/40 rounded-md border border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left min-w-0 space-y-0.5">
                    <p className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100 truncate">
                      {order?.productName || order?.channelOrderNumber || `Package #${orderNum}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        Qty: 1
                      </span>
                      {order?.length && order?.breadth && order?.height && (
                        <span className="inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          Dims: {order.length}×{order.breadth}×{order.height} cm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
