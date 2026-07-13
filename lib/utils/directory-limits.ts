// Shared, client-safe limits for the public agent directory. Kept in their own
// module (no server imports) so both the server query layer and the client
// explorer component can import them without pulling server code into the
// browser bundle.

/** Fixed page size — clients cannot request larger pages. */
export const DIRECTORY_PAGE_SIZE = 25

/**
 * Hard cap on pagination depth. DIRECTORY_MAX_PAGE * DIRECTORY_PAGE_SIZE is the
 * most rows reachable for any single query, so the public endpoint can't be
 * walked to dump a whole state.
 */
export const DIRECTORY_MAX_PAGE = 40
