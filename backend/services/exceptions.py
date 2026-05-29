class DomainException(Exception):
    """Base for domain-layer exceptions. Routers catch these and map to HTTP responses."""
    status_code: int = 400


class NotFoundException(DomainException):
    status_code = 404


class ConflictException(DomainException):
    status_code = 409
