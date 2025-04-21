<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250121220938 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE connection ADD initiating_user_id INT NOT NULL');
        $this->addSql('ALTER TABLE connection ADD CONSTRAINT FK_29F773669E1BD855 FOREIGN KEY (initiating_user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_29F773669E1BD855 ON connection (initiating_user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE connection DROP FOREIGN KEY FK_29F773669E1BD855');
        $this->addSql('DROP INDEX IDX_29F773669E1BD855 ON connection');
        $this->addSql('ALTER TABLE connection DROP initiating_user_id');
    }
}
