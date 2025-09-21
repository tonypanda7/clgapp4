import type { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

// Minimal auth: reuse simple token format token_<userId>_<ts>
function getUserIdFromAuth(header?: string): string | null {
  if (!header) return null;
  const token = header.replace("Bearer ", "");
  if (token.startsWith("token_")) {
    const parts = token.split("_");
    return parts[1] || null;
  }
  return null; // For brevity; extend if using JWTs
}

export const handleUpload: RequestHandler = async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { filename, contentType, data, bucket = "posts" } = req.body || {};
    if (!filename || !contentType || !data) {
      return res.status(400).json({ success: false, message: "filename, contentType and base64 data are required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
    if (!supabaseUrl || !serviceRole) {
      return res.status(501).json({ success: false, message: "Server not configured for uploads. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE." });
    }

    const admin = createClient(supabaseUrl, serviceRole);

    const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
    const path = `${userId}/${Date.now()}_${safeName}`;

    const buffer = Buffer.from(data, "base64");

    const { error } = await admin.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

    if (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ success: false, message: error.message || "Upload failed" });
    }

    const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);
    return res.status(201).json({ success: true, url: pub.publicUrl, path });
  } catch (e: any) {
    console.error("/api/upload error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
