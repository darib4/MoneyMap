import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://quqvicevvargktyfplrm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fxznL7kEqUFip-sHegLieQ_rg_G5pDU";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);