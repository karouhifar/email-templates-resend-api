import type { Request, Response } from "express";
import { OwnerDTO } from "../model";

export const OwnerController = {
  list: async (req: Request, res: Response) => {
    const ownerDTO = new OwnerDTO();
    const owners = ownerDTO.findAll();
    res.json({ ok: true, data: owners });
  },

  get: async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!key) return res.status(400).json({ ok: false, error: "Missing key" });
    const ownerDTO = new OwnerDTO();
    const owner = ownerDTO.findByKeyId(key);
    if (!owner)
      return res.status(404).json({ ok: false, error: "Owner not found" });
    res.json({ ok: true, data: owner });
  },

  upsert: async (req: Request, res: Response) => {
    const { isOwner, name, email } = req.body ?? {};
    const ownerDTO = new OwnerDTO();
    const saved = ownerDTO.create({ isOwner, name, email });
    res.status(201).json({ ok: true, data: saved });
  },

  remove: async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!key) return res.status(400).json({ ok: false, error: "Missing key" });
    const ownerDTO = new OwnerDTO();
    const exists = ownerDTO.findByKeyId(key);
    if (!exists)
      return res.status(404).json({ ok: false, error: "Owner not found" });
    ownerDTO.remove({ key_id: key });
    res.json({ ok: true });
  },
};
