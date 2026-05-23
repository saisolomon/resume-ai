// Twitter-image inherits the same design as opengraph-image.tsx because
// the summary_large_image card uses 1200×630 too. Keeping them as
// separate files (vs. just exporting twitter metadata) lets each be
// tuned independently if we want different crops later.
export { default, alt, size, contentType } from "./opengraph-image";
