/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

-- Add default_graphic_unit to the groups table.
ALTER TABLE meters
    ADD COLUMN IF NOT EXISTS area_unit area_unit_type NOT NULL DEFAULT 'none';