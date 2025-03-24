<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250204040737 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add progress_entry table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE progress_entry (
          id INT AUTO_INCREMENT NOT NULL,
          project_id INT NOT NULL,
          created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
          entry_date DATETIME NOT NULL,
          value NUMERIC(12, 2) NOT NULL,
          type VARCHAR(255) NOT NULL,
          units VARCHAR(255) NOT NULL,
          INDEX IDX_C9996E4B166D1F9C (project_id),
          PRIMARY KEY(id)
        ) DEFAULT CHARACTER
        SET
          utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE
          progress_entry
        ADD
          CONSTRAINT FK_C9996E4B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE report DROP review_notes');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE progress_entry DROP FOREIGN KEY FK_C9996E4B166D1F9C');
        $this->addSql('DROP TABLE progress_entry');
        $this->addSql('ALTER TABLE report ADD review_notes VARCHAR(255) DEFAULT NULL');
    }
}
