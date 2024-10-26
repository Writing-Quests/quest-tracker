<?php

namespace App\State;

final class NotLoggedInRepresentation {
    public bool $anonymousUser = true;
    public function isPublic() {
        return true;
    }
}
