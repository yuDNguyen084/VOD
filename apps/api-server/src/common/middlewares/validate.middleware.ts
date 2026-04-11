export const validate = (schema: any) => async (req: any, res: any, next: any) => {
  try { await schema.parseAsync({ body: req.body, query: req.query }); next(); } 
  catch (e: any) { res.status(400).json({ errors: e.errors }); }
};