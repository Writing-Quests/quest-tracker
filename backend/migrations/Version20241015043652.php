<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241015043652 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE project_goal (
          id INT AUTO_INCREMENT NOT NULL,
          project_id INT NOT NULL,
          type VARCHAR(255) NOT NULL,
          units VARCHAR(255) NOT NULL,
          goal NUMERIC(12, 2) NOT NULL,
          created_at DATETIME NOT NULL,
          edited_at DATETIME NOT NULL,
          start_date DATE DEFAULT NULL,
          end_date DATE DEFAULT NULL,
          progress LONGTEXT NOT NULL COMMENT \'(DC2Type:simple_array)\',
          INDEX IDX_C54D2336166D1F9C (project_id),
          PRIMARY KEY(id)
        ) DEFAULT CHARACTER
        SET
          utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE
          project_goal
        ADD
          CONSTRAINT FK_C54D2336166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE project_goal DROP FOREIGN KEY FK_C54D2336166D1F9C');
        $this->addSql('DROP TABLE project_goal');
    }
}
