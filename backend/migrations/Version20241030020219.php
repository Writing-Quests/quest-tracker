<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241030020219 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report ADD created_at DATETIME NOT NULL, ADD reviewed_at DATETIME DEFAULT NULL, DROP submitted_at, DROP reviewed, DROP type, DROP edited_at, CHANGE path path VARCHAR(255) NOT NULL, CHANGE details details VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report ADD submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', ADD reviewed TINYINT(1) NOT NULL, ADD type VARCHAR(255) DEFAULT NULL, ADD edited_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', DROP created_at, DROP reviewed_at, CHANGE path path LONGTEXT NOT NULL, CHANGE details details LONGTEXT DEFAULT NULL');
    }
}
