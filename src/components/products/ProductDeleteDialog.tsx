import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import type { Product } from "@/hooks/useN8nData";

interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ProductDeleteDialog({ product, open, onOpenChange, onConfirm, isLoading }: ProductDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[400px] glass-card border-border/50">
        <AlertDialogHeader className="text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto sm:mx-0 mb-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-lg sm:text-xl">
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{product?.displayName || product?.name || 'this product'}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {product?.image_url_1 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
            <img 
              src={product.image_url_1} 
              alt="" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{product.displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="border-border/50 w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
