export const validate = (schema: any) => async (req: any, res: any, next: any) => {
  try { await schema.parseAsync({ body: req.body, query: req.query }); next(); } 
  catch (e: any) { 
    const message = e.issues?.[0]?.message || e.message || 'Dữ liệu không hợp lệ';
    res.status(400).json({ success: false, message, errors: e.issues }); 
  }
};