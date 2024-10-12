<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241010175733 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE project (
          id INT AUTO_INCREMENT NOT NULL,
          user_id INT NOT NULL,
          created_at DATETIME NOT NULL DEFAULT NOW(),
          edited_at DATETIME NOT NULL DEFAULT NOW(),
          title VARCHAR(255) DEFAULT NULL,
          details JSON DEFAULT (JSON_OBJECT()),
          public TINYINT(1) DEFAULT 0 NOT NULL,
          INDEX IDX_2FB3D0EEA76ED395 (user_id),
          PRIMARY KEY(id)
        ) DEFAULT CHARACTER
        SET
          utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE
          project
        ADD
          CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');
        $this->addSql('DROP TABLE project');
    }
}
