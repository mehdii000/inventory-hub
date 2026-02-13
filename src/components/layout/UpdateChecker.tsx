import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type UpdateStatus = "idle" | "checking" | "available" | "not-available" | "updating" | "error";

export function UpdateChecker() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [showDialog, setShowDialog] = useState(false);

  const checkForUpdate = useCallback(async () => {
    setStatus("checking");
    try {
      const updateAvailable = await window.electronAPI.checkForUpdate();
      console.log("Found update? " + updateAvailable);
      if (updateAvailable) {
        setStatus("available");
        setShowDialog(true);
      } else {
        setStatus("not-available");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, []);

  const beginUpdate = useCallback(async () => {
    setShowDialog(false);
    setStatus("updating");
    try {
      window.electronAPI.beginUpdate()
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, []);

  // Auto-check on mount
  useEffect(() => {
    const timer = setTimeout(checkForUpdate, 2000);
    return () => clearTimeout(timer);
  }, [checkForUpdate]);

  return (
    <>
      {/* Sidebar button */}
      <button
        onClick={checkForUpdate}
        disabled={status === "checking" || status === "updating"}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:opacity-50"
      >
        {status === "checking" && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
        {status === "updating" && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
        {status === "available" && <Download className="h-4 w-4 shrink-0 text-primary" />}
        {status === "not-available" && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
        {status === "error" && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
        {status === "idle" && <RefreshCw className="h-4 w-4 shrink-0" />}

        <span className="text-xs truncate">
          {status === "checking" && t("update.checking")}
          {status === "updating" && t("update.installing")}
          {status === "available" && t("update.available")}
          {status === "not-available" && t("update.upToDate")}
          {status === "error" && t("update.error")}
          {status === "idle" && t("update.check")}
        </span>

        {status === "available" && (
          <Badge variant="default" className="ml-auto text-[9px] px-1.5 py-0">
            NEW
          </Badge>
        )}
      </button>

      {/* Update available dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              {t("update.dialogTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("update.dialogDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("update.later")}</AlertDialogCancel>
            <AlertDialogAction onClick={beginUpdate}>
              {t("update.installNow")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
